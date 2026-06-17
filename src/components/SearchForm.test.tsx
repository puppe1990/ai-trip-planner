import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/src/i18n';
import { DEFAULT_SEARCH } from '@/src/data';
import { getQuickDestinationsForRegion } from '@/src/lib/quick-destinations';
import SearchForm from './SearchForm';

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.ComponentProps<'div'> & { whileHover?: unknown; whileTap?: unknown }) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.ComponentProps<'button'> & { whileHover?: unknown; whileTap?: unknown }) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe('SearchForm quick destinations', () => {
  const onSubmit = vi.fn();
  const setSearchParams = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });

  function renderForm() {
    return render(
      <SearchForm
        searchParams={DEFAULT_SEARCH}
        setSearchParams={setSearchParams}
        onSubmit={onSubmit}
        isLoading={false}
      />,
    );
  }

  it('renders region filter buttons with brazil separated from continents', () => {
    renderForm();
    const regionFilters = within(screen.getByTestId('quick-region-filters'));

    expect(regionFilters.getByRole('button', { name: /Brasil/i })).toBeInTheDocument();
    expect(regionFilters.getByRole('button', { name: /Europa/i })).toBeInTheDocument();
    expect(regionFilters.getByRole('button', { name: /Ásia/i })).toBeInTheDocument();
    expect(regionFilters.getByRole('button', { name: /Américas/i })).toBeInTheDocument();
    expect(regionFilters.getByRole('button', { name: /África/i })).toBeInTheDocument();
    expect(regionFilters.getByRole('button', { name: /Oceania/i })).toBeInTheDocument();
  });

  it('shows brazil pre-suggestions by default', () => {
    renderForm();

    for (const dest of getQuickDestinationsForRegion('brazil')) {
      expect(
        screen.getByRole('button', { name: new RegExp(i18n.t(`quickDest.${dest.key}.name`), 'i') }),
      ).toBeInTheDocument();
    }
  });

  it('marks the active region button with aria-pressed', () => {
    renderForm();
    const regionFilters = within(screen.getByTestId('quick-region-filters'));

    expect(regionFilters.getByRole('button', { name: /Brasil/i })).toHaveAttribute('aria-pressed', 'true');
    expect(regionFilters.getByRole('button', { name: /Europa/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches pre-suggestions when a continent filter is selected', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /Europa/i }));

    expect(screen.getByRole('button', { name: /Paris, França/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roma, Itália/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Rio de Janeiro, Brasil/i })).not.toBeInTheDocument();
    expect(within(screen.getByTestId('quick-region-filters')).getByRole('button', { name: /Europa/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('submits the selected quick destination params', async () => {
    const user = userEvent.setup();
    const [rio] = getQuickDestinationsForRegion('brazil');
    renderForm();

    await user.click(screen.getByRole('button', { name: /Rio de Janeiro, Brasil/i }));

    expect(onSubmit).toHaveBeenCalledWith(rio.params);
  });
});
