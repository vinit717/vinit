import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Portfolio interactions', () => {
  it('shows the actual project context and materials without requiring expansion', () => {
    render(<Index />);
    expect(screen.getByRole('heading', { name: 'White-label design system' })).toBeInTheDocument();
    expect(screen.getByText(/Built to be reconfigured, not forked/).closest('[hidden]')).toBeNull();
    expect(screen.getByText('Design tokens')).toBeInTheDocument();
  });
  it('changes the design-system theme and mobile preview tab independently', () => {
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview peach theme' }));
    expect(screen.getByRole('button', { name: 'Preview peach theme' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Mellow')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Saved' }));
    expect(screen.getByText('All the little things')).toBeInTheDocument();
  });
  it('lets the visitor complete and reset the illustrative confirmation', () => {
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Try the interaction' }));
    expect(screen.getByText('And you’re all set.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try it again' }));
    expect(screen.getByText('One less thing to think about.')).toBeInTheDocument();
  });
  it('changes the workspace palette, responds to a little love, and pauses motion', () => {
    const { container } = render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Blue workspace' }));
    expect(screen.getByRole('button', { name: 'Blue workspace' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sunshine workspace' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Give the idea some love' }));
    expect(screen.getByText('goes a long way.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset the little heart' }));
    expect(screen.getByRole('button', { name: 'Give the idea some love' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Pause ambient animation' }));
    expect(container.querySelector('.edition')).toHaveClass('motion-paused');
    fireEvent.click(screen.getByRole('button', { name: 'Resume ambient animation' }));
    expect(container.querySelector('.edition')).not.toHaveClass('motion-paused');
  });
  it('filters projects and restores all the work', () => {
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));
    expect(screen.getByRole('heading', { name: 'Cross-platform mobile app' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'White-label design system' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('01 selected pieces');
    fireEvent.click(screen.getByRole('button', { name: 'Systems' }));
    expect(screen.getByRole('heading', { name: 'Testing ecosystem' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('02 selected pieces');
    fireEvent.click(screen.getByRole('button', { name: 'All work 04' }));
    expect(screen.getByRole('status')).toHaveTextContent('04 selected pieces');
    expect(screen.getByRole('heading', { name: 'Payment interfaces at scale' })).toBeInTheDocument();
  });
  it('copies the real contact address with confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));
    await waitFor(() => expect(screen.getByText('Email copied')).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith('vinit224488@gmail.com');
    expect(screen.getByRole('link', { name: /Get in touch/ })).toHaveAttribute('href', 'mailto:vinit224488@gmail.com');
  });
  it('keeps the address available when clipboard permission is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard unavailable')) } });
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));
    expect(await screen.findByText('vinit224488@gmail.com')).toHaveAttribute('href', 'mailto:vinit224488@gmail.com');
    expect(screen.queryByText('Email copied')).not.toBeInTheDocument();
  });
});
