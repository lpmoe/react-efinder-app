import React from "react";
import classNames from "classnames";
import CreatableSelect from "react-select/lib/Creatable";
import { withStyles } from "@material-ui/core/styles";
import NoSsr from "@material-ui/core/NoSsr";
import TextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import { emphasize } from "@material-ui/core/styles/colorManipulator";

const suggestions = [{ label: 'Java' }, { label: 'UI Design' }].map(
  suggestion => ({
    value: suggestion.label,
    label: suggestion.label
  })
);

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  input: {
    display: "flex",
    padding: 0
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === "light"
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    )
  }
});

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          ref: props.innerRef,
          children: props.children,
          ...props.innerProps
        }
      }}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused
      })}
      onDelete={event => {
        props.removeProps.onClick();
        props.removeProps.onMouseDown(event);
      }}
    />
  );
}

const components = {
  Option,
  Control,
  MultiValue
};

class CustomReactSelect extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = name => value => {
    this.props.onChange(name, value);
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <NoSsr>
          <CreatableSelect
            classes={classes}
            options={suggestions}
            components={components}
            onChange={this.handleChange(this.props.id)}
            value={this.props.value}
            placeholder={this.props.placeholder}
            isMulti
          />
        </NoSsr>
      </div>
    );
  }
}

export default withStyles(styles)(CustomReactSelect);