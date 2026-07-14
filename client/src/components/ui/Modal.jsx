/**
 * @file Modal.jsx
 * @description Reusable modal dialog component for Cervify.
 *
 * Renders a centered overlay with a white/surface card, a header row
 * (title + close button), and the `children` content.
 *
 * Usage:
 * @example
 * <Modal title="Add Department" isOpen={showModal} onClose={() => setShowModal(false)}>
 *   <form onSubmit={handleSubmit}>...</form>
 * </Modal>
 *
 * Accessibility:
 *  - Clicking the dark backdrop calls onClose
 *  - The close "×" button has an aria-label
 *  - The modal container has role="dialog"
 */

import React from 'react';
import { X } from 'lucide-react';

/**
 * @param {{
 *   title: string,
 *   isOpen: boolean,
 *   onClose: () => void,
 *   children: React.ReactNode,
 *   width?: number
 * }} props
 */
export default function Modal({ title, isOpen, onClose, children, width = 500 }) {
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}               /* Close when clicking backdrop */
            role="presentation"
        >
            <div
                className="modal-content"
                style={{ width }}
                onClick={e => e.stopPropagation()} /* Prevent backdrop click propagation */
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* ── Modal Header ─────────────────────────────────── */}
                <div className="modal-header">
                    <h3 id="modal-title" style={{ margin: 0, fontSize: 18 }}>{title}</h3>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* ── Modal Body ───────────────────────────────────── */}
                {children}
            </div>
        </div>
    );
}
