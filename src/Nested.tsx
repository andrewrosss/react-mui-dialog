import { Button, Container, makeStyles } from "@material-ui/core";

import React from "react";
import { useMaterialDialog } from "./MaterialDialog";

export const Nested = () => {
  const { openDialog } = useMaterialDialog();

  const classes = makeStyles((theme) => ({
    root: {
      margin: "16px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  }))();

  const handleClick =
    openDialog ?? (() => console.log("openDialog is undefined"));

  return (
    <Container className={classes.root}>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        Open Dialog
      </Button>
    </Container>
  );
};
