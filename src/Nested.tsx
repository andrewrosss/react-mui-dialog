import * as Yup from "yup";

import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React, { useState } from "react";

import { useDialog } from "./Dialog";

export const Nested = () => {
  const { openDialog, closeDialog } = useDialog();

  const classes = makeStyles((theme) => ({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing(2),
      margin: theme.spacing(2, "auto"),
    },
    deleteButton: {
      "&:hover": {
        color: theme.palette.getContrastText(theme.palette.error.dark),
        backgroundColor: theme.palette.error.dark,
        borderColor: theme.palette.error.dark,
      },
    },
  }))();

  const deleteDocument = (id: any) => async () => {
    alert(`deleted document: ${id}`);
  };

  const openDeleteDialog = () => {
    openDialog({
      title: "Delete Document",
      content: "Are you sure you want to delete this document?",
      actionButton: "Delete",
      actionButtonProps: {
        variant: "outlined",
      },
      initialValues: {
        confirmationText: "",
      },
      validationSchema: Yup.object({
        confirmationText: Yup.string()
          .required("Re-type the document name")
          .equals(["mydocument"], "document name must match"),
      }),
      labels: {
        confirmationText: `Type ${"mydocument"} to delete`,
      },
      onSubmit: deleteDocument("asdkfhaskdfasl"),
    });
  };

  const openSignupDialog = () => {
    openDialog({
      title: "Signup",
      content: "Just one more step, create your account and get started!",
      actionButton: "Signup",
      actionButtonProps: {
        variant: "contained",
      },
      initialValues: {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
      },
      labels: {
        email: "Email",
        firstName: "First Name",
        lastName: "Last Name",
        password: "Password",
      },
      validationSchema: Yup.object({
        email: Yup.string().email().required(),
        firstName: Yup.string().required(),
        lastName: Yup.string().required(),
        password: Yup.string().min(10).required(),
      }),
      onSubmit: async ({ email, firstName, lastName, password }) => {
        alert(
          `${firstName} ${lastName} just signed up with email [${email}] and password [${password}]`
        );
      },
    });
  };

  const openCustomFormDialog = () => {
    openDialog({
      customForm: <CustomForm onClose={closeDialog} />,
    });
  };

  return (
    <Container className={classes.root}>
      <Button
        variant="outlined"
        color="primary"
        className={classes.deleteButton}
        onClick={openDeleteDialog}
      >
        Delete
      </Button>
      <Button
        variant="contained"
        color="secondary"
        disableElevation
        onClick={openSignupDialog}
      >
        Signup
      </Button>
      <Button variant="outlined" color="default" onClick={openCustomFormDialog}>
        Save
      </Button>
    </Container>
  );
};

const CustomForm: React.FC<{ onClose: any }> = ({ onClose }) => {
  const [state, setState] = useState({ email: "", additionalQuestion: false });
  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };
  const aqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Collected email [${state.email}] with answer to additional question [${state.additionalQuestion}]`
    );
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "16px",
        padding: "16px",
      }}
    >
      <Typography variant="h6">Custom Dialog Heading</Typography>
      <Typography color="textSecondary">
        This is some additional text to show to the user
      </Typography>
      <TextField
        type="email"
        name="email"
        label={"Email"}
        variant="filled"
        fullWidth
        required
        value={state.email}
        onChange={emailChange}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="additionalQuestion"
            value={state.additionalQuestion}
            onChange={aqChange}
          />
        }
        label="Add me to the mailing list"
      />
      <div style={{ alignSelf: "end", display: "flex", gap: "16px" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};
