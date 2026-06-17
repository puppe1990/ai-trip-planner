import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/src/i18n';
import { PROVIDER_MODELS } from '@/src/lib/ai-config';
import AiSettingsModal from './AiSettingsModal';

const getAiConfigFnMock = vi.fn();
const updateAiConfigFnMock = vi.fn();

vi.mock('@/src/server/ai.functions', () => ({
  getAiConfigFn: () => getAiConfigFnMock(),
  updateAiConfigFn: (input: unknown) => updateAiConfigFnMock(input),
}));

vi.mock('react-select', () => ({
  default: ({
    inputId,
    'aria-label': ariaLabel,
    options,
    value,
    onChange,
    isDisabled,
  }: {
    inputId?: string;
    'aria-label'?: string;
    options: Array<{ value: string; label: string }>;
    value: { value: string; label: string } | null;
    onChange: (option: { value: string; label: string } | null) => void;
    isDisabled?: boolean;
  }) => (
    <select
      id={inputId}
      aria-label={ariaLabel}
      value={value?.value ?? ''}
      disabled={isDisabled}
      onChange={(event) => {
        const option = options.find((item) => item.value === event.target.value) ?? null;
        onChange(option);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
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
      providers: [
        {
          id: 'gemini',
          displayName: 'Google Gemini',
          defaultModel: 'gemini-3.5-flash',
          models: PROVIDER_MODELS.gemini,
          capabilities: { structuredJson: true, webGrounding: true },
          configured: true,
        },
        {
          id: 'nvidia-nim',
          displayName: 'NVIDIA NIM',
          defaultModel: 'meta/llama-3.3-70b-instruct',
          models: PROVIDER_MODELS['nvidia-nim'],
          capabilities: { structuredJson: true, webGrounding: false },
          configured: true,
        },
      ],
    });
    updateAiConfigFnMock.mockResolvedValue({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });

  it('opens modal and shows provider and model from server', async () => {
    const user = userEvent.setup();

    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Configurações da IA', { selector: 'h2' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('Provider')).toHaveValue('gemini');
      expect(screen.getByLabelText('Modelo')).toHaveValue('gemini-3.5-flash');
      expect(screen.getByText('JSON estruturado')).toBeInTheDocument();
      expect(screen.getByText('Busca web')).toBeInTheDocument();
    });

    expect(getAiConfigFnMock).toHaveBeenCalledOnce();
  });

  it('lists multiple nvidia model options in the model select', async () => {
    const user = userEvent.setup();
    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Provider')).toHaveValue('gemini');
    });

    await user.selectOptions(screen.getByLabelText('Provider'), 'nvidia-nim');

    const modelSelect = screen.getByLabelText('Modelo');
    expect(modelSelect).toHaveValue('meta/llama-3.3-70b-instruct');
    expect(screen.getByRole('option', { name: 'Mistral Large' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'QwQ 32B' })).toBeInTheDocument();
  });

  it('updates capabilities when provider selection changes', async () => {
    const user = userEvent.setup();
    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Provider')).toHaveValue('gemini');
    });

    await user.selectOptions(screen.getByLabelText('Provider'), 'nvidia-nim');

    expect(screen.getByLabelText('Modelo')).toHaveValue('meta/llama-3.3-70b-instruct');
    expect(screen.getByText('Busca web indisponível')).toBeInTheDocument();
  });

  it('saves provider preference to server', async () => {
    const user = userEvent.setup();
    render(<AiSettingsModal />);

    await user.click(screen.getByRole('button', { name: 'Configurações da IA' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Provider')).toHaveValue('gemini');
    });

    await user.selectOptions(screen.getByLabelText('Provider'), 'nvidia-nim');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(updateAiConfigFnMock).toHaveBeenCalledWith({
        data: { providerId: 'nvidia-nim', model: 'meta/llama-3.3-70b-instruct' },
      });
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
      expect(screen.getByText('Não foi possível carregar as configurações.')).toBeInTheDocument();
    });
  });
});
