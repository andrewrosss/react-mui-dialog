import * as Yup from "yup";

import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  makeStyles,
  withStyles,
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

  const openNotificationDialog = () => {
    openDialog({
      title: "Version 2.11.3",
      contentText: "Here's what's new in version 2.11.3! ...",
      cancelButton: false,
      submitButton: { children: "OK" },
    });
  };

  const deleteDocument = (id: any) => async () => {
    alert(`Deleted document with ID [${id}]`);
  };

  const openDeleteDialog = (id: string, name: string) => () => {
    openDialog({
      title: "Delete This Document?",
      contentText: (
        <>
          This cannot be undone. Type the text <b>{name}</b> to proceed.
        </>
      ),
      submitButton: {
        component: (
          <ErrorButton variant="contained" type="submit">
            Delete
          </ErrorButton>
        ),
      },
      fields: {
        confirmationText: {
          initialValue: "",
          validationSchema: Yup.string()
            .required("Re-type the document name")
            .equals([name], "Input must match document name"),
          fieldProps: { label: `Type ${name} to delete` },
        },
      },
      onSubmit: deleteDocument(id),
    });
  };

  const openSignupDialog = () => {
    openDialog({
      title: "Signup",
      contentText: "Just one more step, create your account and get started!",
      submitButton: { children: "Signup", props: { variant: "contained" } },
      fields: {
        email: {
          initialValue: "",
          validationSchema: Yup.string().email().required(),
          fieldProps: { label: "Email" },
        },
        firstName: {
          initialValue: "",
          validationSchema: Yup.string().required(),
          fieldProps: { label: "First name" },
        },
        lastName: {
          initialValue: "",
          validationSchema: Yup.string().required(),
          fieldProps: { label: "Last name" },
        },
        password: {
          initialValue: "",
          validationSchema: Yup.string().min(10).required(),
          fieldProps: { label: "Password", type: "password" },
        },
      },
      onSubmit: async ({ email, firstName, lastName, password }) => {
        alert(
          `${firstName} ${lastName} just signed up with email [${email}] and password [${password}]`
        );
      },
    });
  };

  const openCustomFormDialog = () => {
    openDialog({
      customContent: <CustomForm onClose={closeDialog} />,
    });
  };

  return (
    <Container className={classes.root}>
      <Button onClick={openNotificationDialog}>View</Button>
      <Button
        variant="outlined"
        color="primary"
        className={classes.deleteButton}
        onClick={openDeleteDialog("xzvf", "My Document")}
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

const ErrorButton = withStyles((theme) => ({
  root: {
    backgroundColor: "crimson",
    color: theme.palette.getContrastText(theme.palette.error.main),
    "&:hover": {
      backgroundColor: "crimson",
      opacity: 0.8,
    },
  },
}))(Button);
