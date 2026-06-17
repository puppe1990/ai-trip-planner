import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/src/i18n';
import AiSettingsModal from './AiSettingsModal';

const getAiConfigFnMock = vi.fn();

vi.mock('@/src/server/ai.functions', () => ({
  getAiConfigFn: () => getAiConfigFnMock(),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onClick, ...props }: React.ComponentProps<'div'>) => (
      <div {...props} onClick={onClick}>
        {children}
      </div>
    ),
  },
}));

describe('AiSettingsModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    getAiConfigFnMock.mockResolvedValue({
      providerId: 'gemini',
      provider: 'Google Gemini',
      model: 'gemini-3.5-flash',
      capabilities: { structuredJson: true, webGrounding: true },
    });
  });

  it('opens modal and shows provider and model from server', async () => {
    const user = userEvent.setup();

    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Configurações da IA', { selector: 'h2' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Google Gemini')).toBeInTheDocument();
      expect(screen.getByText('gemini')).toBeInTheDocument();
      expect(screen.getByText('gemini-3.5-flash')).toBeInTheDocument();
      expect(screen.getByText('JSON estruturado')).toBeInTheDocument();
      expect(screen.getByText('Busca web')).toBeInTheDocument();
    });

    expect(getAiConfigFnMock).toHaveBeenCalledOnce();
  });

  it('shows disabled web grounding capability for nvidia-nim', async () => {
    getAiConfigFnMock.mockResolvedValue({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
    });

    const user = userEvent.setup();
    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    await waitFor(() => {
      expect(screen.getByText('NVIDIA NIM')).toBeInTheDocument();
      expect(screen.getByText('nvidia-nim')).toBeInTheDocument();
      expect(screen.getByText('JSON estruturado')).toBeInTheDocument();
      expect(screen.getByText('Busca web indisponível')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows fallback when config fetch fails', async () => {
    getAiConfigFnMock.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });
  });
});
