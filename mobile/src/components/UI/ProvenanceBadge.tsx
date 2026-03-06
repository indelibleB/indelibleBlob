import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProvenanceGrade } from '@shared/types';

interface ProvenanceBadgeProps {
    grade: ProvenanceGrade;
    score?: number;
    compact?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ grade, score, compact }) => {
    const getGradeConfig = () => {
        switch (grade) {
            case 'GOLD':
                return { color: '#FFD700', icon: 'shield-checkmark', label: 'Gold Proof' };
            case 'SILVER':
                return { color: '#C0C0C0', icon: 'shield', label: 'Silver Grade' };
            case 'UNTRUSTED':
            default:
                return { color: '#FF6B6B', icon: 'shield-outline', label: 'Untrusted Device' };
        }
    };

    const config = getGradeConfig();

    if (compact) {
        if (grade === 'UNTRUSTED' && compact) return null; // Don't clutter thumbnails with untrusted icons

        return (
            <View style={[styles.compactContainer, { backgroundColor: config.color + '33' }]}>
                <Ionicons name={config.icon as any} size={14} color={config.color} />
                {score !== undefined && (
                    <Text style={[styles.compactScore, { color: config.color }]}>{score}% Forensic</Text>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.container, { borderColor: config.color }]}>
            <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
                <Ionicons name={config.icon as any} size={18} color="#000" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#111',
        paddingRight: 10,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    iconContainer: {
        padding: 8,
        marginRight: 8,
    },
    textContainer: {
        paddingVertical: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    score: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    compactScore: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
