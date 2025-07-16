import React, { ReactNode } from "react";

interface buttonProps {
  children: ReactNode;
  color?: "primary" | "secondary"; // ? -> Tell the compiler that this is optional
  onClick: () => void;
}

const Button = ({ children, color = "primary", onClick }: buttonProps) => {
  return (
    <button type="button" className={"btn btn-" + color} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
