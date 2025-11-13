import React from "react";
import { ShellBar, Avatar } from "@ui5/webcomponents-react";
// Si YA importaste los assets globales en main.jsx, puedes borrar estas 2 líneas:
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

const Navbar = () => {
  return (
    <ShellBar
      primaryTitle="Error Manager"
      profile={
        <Avatar
          image="https://i.imgur.com/JqEuJ6t.png"
          shape="Circle"
          size="S"
          accessibleName="Administrator"
        />
      }
    />
  );
};

export default Navbar;
