/// Sovereign Blob — Seal Access Policy for indelible.Blob
/// Based on the Private Data pattern from MystenLabs/seal.
///
/// Owner-only decryption: only the creator can decrypt their Sovereign captures.
/// Key ID format: [package_id][creator_address][nonce]
module indelible_blob::sovereign_blob;

const ENoAccess: u64 = 77;

public struct SovereignBlob has key, store {
    id: UID,
    creator: address,
    nonce: vector<u8>,
    encrypted_blob_id: vector<u8>,
    content_hash: vector<u8>,
    timestamp: u64,
}

/// Compute the IBE key ID: [creator_address][nonce]
/// Seal prepends the package ID automatically.
fun compute_key_id(sender: address, nonce: vector<u8>): vector<u8> {
    let mut blob = sender.to_bytes();
    blob.append(nonce);
    blob
}

/// Store a reference to an encrypted Sovereign Blob.
/// Called after encrypting the capture and uploading to Walrus.
public entry fun store_entry(
    nonce: vector<u8>,
    encrypted_blob_id: vector<u8>,
    content_hash: vector<u8>,
    timestamp: u64,
    ctx: &mut TxContext
) {
    transfer::transfer(SovereignBlob {
        id: object::new(ctx),
        creator: ctx.sender(),
        nonce,
        encrypted_blob_id,
        content_hash,
        timestamp,
    }, ctx.sender());
}

//////////////////////////////////////////////
/// Access control
/// Key format: [pkg_id][creator][nonce]
/// Only the owner of the SovereignBlob object can decrypt.

entry fun seal_approve(id: vector<u8>, e: &SovereignBlob) {
    let key_id = compute_key_id(e.creator, e.nonce);
    assert!(key_id == id, ENoAccess);
}
