import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the platform home page', () => {
  render(<App />);
  expect(screen.getByText(/SuiviDiabète SN/i)).toBeInTheDocument();
});
