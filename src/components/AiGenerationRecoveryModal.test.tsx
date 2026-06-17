import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/src/i18n';
import { PROVIDER_MODELS } from '@/src/lib/ai-config';
import AiGenerationRecoveryModal from './AiGenerationRecoveryModal';

const getAiConfigFnMock = vi.fn();
const updateAiConfigFnMock = vi.fn();
const onRetryMock = vi.fn();

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

const errorText =
  'NVIDIA NIM request failed (503): {"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}';

describe('AiGenerationRecoveryModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    onRetryMock.mockResolvedValue(undefined);
    getAiConfigFnMock.mockResolvedValue({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
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
      providerId: 'gemini',
      provider: 'Google Gemini',
      model: 'gemini-3.5-flash',
      capabilities: { structuredJson: true, webGrounding: true },
    });
  });

  it('shows model-not-found guidance for nvidia 404 errors', async () => {
    render(
      <AiGenerationRecoveryModal
        open
        errorText="NVIDIA NIM request failed (404): 404 page not found"
        onClose={vi.fn()}
        onRetry={onRetryMock}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Este modelo não está disponível na API NVIDIA NIM. Escolha outro modelo da lista.'),
      ).toBeInTheDocument();
    });
  });

  it('shows parsed error and allows retry with updated settings', async () => {
    const user = userEvent.setup();

    render(<AiGenerationRecoveryModal open errorText={errorText} onClose={vi.fn()} onRetry={onRetryMock} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        ),
      ).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Provider'), 'gemini');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => {
      expect(updateAiConfigFnMock).toHaveBeenCalledWith({
        data: { providerId: 'gemini', model: 'gemini-3.5-flash' },
      });
      expect(onRetryMock).toHaveBeenCalledOnce();
    });
  });
});
