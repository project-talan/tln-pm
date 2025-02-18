import { render, screen } from "@testing-library/react";
import App from './App';
import "@testing-library/jest-dom"; // Import matchers

test("Render App component", () => {
  render(<App />);
  const heading = screen.getByTestId("title");

  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent(/Project Management as Code$/);
  expect(heading.tagName).toBe("H1");

});
