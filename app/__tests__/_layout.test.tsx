import { render, screen } from "@testing-library/react-native";

import RootLayout from "../_layout";

jest.mock("expo-router", () => ({
  Stack: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

describe("RootLayout", () => {
  test("renders without crashing", () => {
    render(<RootLayout />);
    expect(screen.getByTestId("root-layout")).toBeTruthy();
  });
});
