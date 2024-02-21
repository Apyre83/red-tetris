import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('Modal Component', () => {
    it('renders the children content', () => {
        const testMessage = 'This is a test';

        render(
            <Modal>
                <div>{testMessage}</div>
            </Modal>
        );

        expect(screen.getByText(testMessage)).toBeInTheDocument();
    });

    it('displays modal with correct structure', () => {
        const testMessage = 'Modal structure test';

        render(
            <Modal>
                <div>{testMessage}</div>
            </Modal>
        );

        const modalContent = screen.getByText(testMessage).parentNode;
        expect(modalContent).toHaveClass('modal-content');
        expect(modalContent?.parentNode).toHaveClass('modal');
    });
});
