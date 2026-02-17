module indelible_blob::capture {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // ============================================================================
    // STRUCTS
    // ============================================================================

    /// Represents a verified capture on-chain.
    struct Capture has key, store {
        id: UID,
        blob_id: String,           // Walrus Blob ID
        content_hash: String,      // SHA-256 Hash of content
        timestamp: u64,
        
        // GPS Data
        gps_latitude: u64,
        gps_longitude: u64,
        gps_altitude: u64,
        gps_accuracy: u64,
        is_rtk: bool,

        session_id: String,
        capture_type: String,
        is_sovereign: bool,

        // Security / Provenance
        teepin_signature: String,
        teepin_public_key: String,
        provenance_grade: String,
        forensic_score: u64,

        // Sensor Data
        accel_x: u64,
        accel_y: u64,
        accel_z: u64,
        compass_heading: u64,
        
        creator: address,
    }

    // ============================================================================
    // EVENTS
    // ============================================================================

    struct CaptureRecorded has copy, drop {
        capture_id: address,
        blob_id: String,
        content_hash: String,
        creator: address,
        timestamp: u64,
        device_grade: String,
    }

    // ============================================================================
    // PUBLIC FUNCTIONS
    // ============================================================================

    /// Create a new Capture object and transfer it to the sender.
    public entry fun record_capture(
        blob_id: vector<u8>,
        content_hash: vector<u8>,
        timestamp: u64,
        gps_latitude: u64,
        gps_longitude: u64,
        gps_altitude: u64,
        gps_accuracy: u64,
        is_rtk: bool,
        session_id: vector<u8>,
        capture_type: vector<u8>,
        is_sovereign: bool,
        teepin_signature: vector<u8>,
        teepin_public_key: vector<u8>,
        provenance_grade: vector<u8>,
        forensic_score: u64,
        accel_x: u64,
        accel_y: u64,
        accel_z: u64,
        compass_heading: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let capture = Capture {
            id: object::new(ctx),
            blob_id: string::utf8(blob_id),
            content_hash: string::utf8(content_hash),
            timestamp,
            gps_latitude,
            gps_longitude,
            gps_altitude,
            gps_accuracy,
            is_rtk,
            session_id: string::utf8(session_id),
            capture_type: string::utf8(capture_type),
            is_sovereign,
            teepin_signature: string::utf8(teepin_signature),
            teepin_public_key: string::utf8(teepin_public_key),
            provenance_grade: string::utf8(provenance_grade),
            forensic_score,
            accel_x,
            accel_y,
            accel_z,
            compass_heading,
            creator: sender,
        };

        // Emit event for indexers
        event::emit(CaptureRecorded {
            capture_id: object::uid_to_address(&capture.id),
            blob_id: capture.blob_id,
            content_hash: capture.content_hash,
            creator: sender,
            timestamp: capture.timestamp,
            device_grade: capture.provenance_grade,
        });

        // Transfer distinct object to sender (they own the NFT-like proof)
        transfer::transfer(capture, sender);
    }
}
