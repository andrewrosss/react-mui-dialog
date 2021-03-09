import { Button, Container, makeStyles } from "@material-ui/core";

import React from "react";
import { useDialog } from "./MaterialDialog";

export const Nested = () => {
  const { openDialog } = useDialog();

  const classes = makeStyles((theme) => ({
    root: {
      margin: "16px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  }))();

  const handleClick = () => {
    openDialog({
      title: "Confirm Action",
      contentText: "Do you want to continue?",
      actionButtonText: "Yes",
      actionButtonProps: {
        variant: "contained",
        disableElevation: true,
        color: "primary",
      },
      onSubmit: async (e) => {
        e.preventDefault();
        console.log("submitting");
      },
    });
  };

  return (
    <Container className={classes.root}>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        Open Dialog
      </Button>
    </Container>
  );
};
