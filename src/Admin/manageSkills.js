import React, { Component } from "react";
import { withRouter } from "react-router";
import CustomReactSelect from '../customReactSelect'
import SkillUtil from '../util/skillUtil'
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import snackbar from "../snackbar";
import Snackbar from '@material-ui/core/Snackbar';

const styles = theme => ({
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    }
});

class ManageSkillContainer extends Component {
  state = {
    skillsMulti : null,
    suggestions : [],
    existingTrackedSkillValues : [],
    saveNotificationOpen: false,
    notificationVariant : '',
    notificationMessage: ''
  };

  handleCustomSelectChange = this.handleCustomSelectChange.bind(this);

  componentWillMount(){
    SkillUtil.getUntrackedSkills(this, 'suggestions');
    SkillUtil.setTrackedSkills(this, 'skillsMulti', 'existingTrackedSkillValues');
  }

  handleCustomSelectChange(key, value) {
    this.setState({ [key]: value });
  }

  handleOpenNotification = (notificationVariant, msg) => {
    this.setState({ notificationVariant: notificationVariant,
                    notificationMessage: msg,
                    saveNotificationOpen: true });
  };

  handleNotificationClose = (event, reason) => {
      if (reason === 'clickaway') {
          return;
      }

      this.setState({ saveNotificationOpen: false });
  };

  handleSubmit = async event => {
    event.preventDefault();
    try {
      let skills = this.state.skillsMulti;
      let skillsToKeep = [];
      let suggestionsToPromote = [];
      let newSkills = [];
      for (let i = 0; i < skills.length; i++) {
        let skillObj = skills[i];
        // Technically a user could make the skill a number, so check if label matches value
        // It only let's you create new objects where the value is not already present and
        // since the we are using db id to store value, you can't have a skill named a number
        // that exists in db (this shouldn't matter because we don't want to save numbers anyways)
        if (!isNaN(skillObj['value']) && skillObj['value'] !== skillObj['label']) {
          skillsToKeep.push(skillObj.value);
        }
        else {
          if (skillObj.__isNew__) {
            // Don't save a skill that is a number (can't prevent from adding)
            if (isNaN(skillObj.label)) {
              newSkills.push(skillObj.label);
            }
          }
          else {
            suggestionsToPromote.push(skillObj.label);
          }
        }
      }

      // Delete unwanted skills
      let existing = this.state.existingTrackedSkillValues;
      let valuesToRemove = existing.subtract(skillsToKeep);
      for (let i = 0; i < valuesToRemove.length; i++) {
        SkillUtil.getSkillsRef().child(valuesToRemove[i]).remove();
      }

      // Reset untracked skills
      let suggestions = this.state.suggestions;
      let remainingSuggestionNames = [];
      for (let i = 0; i < suggestions.length; i++) {
        if (!suggestionsToPromote.includes(suggestions[i].label)) {
          remainingSuggestionNames.push(suggestions[i].label);
        }
      }
      SkillUtil.addUntrackedSkills(remainingSuggestionNames, true);

      // Add new skills (as well as promoted skills)
      let max = Number(existing[existing.length-1]);
      let skillsRef = SkillUtil.getSkillsRef();
      let allNewSkills = suggestionsToPromote.concat(newSkills).filter((v, i, a) => a.indexOf(v) === i);;
      for (let i = 0; i < allNewSkills.length; i++) {
        max += 1;
        skillsRef.child(max).set({name : allNewSkills[i]});
      }

      this.handleOpenNotification("success", "Save successful!");
    }
    catch(error) {
      this.handleOpenNotification("error", "manageSkills save failed: " + error);
    }
  };

  render() {
    let MySnackbarContentWrapper = snackbar;
    let classes = this.props.classes;
    return (
      <div>
        <CustomReactSelect
          id='skillsMulti'
          onChange={this.handleCustomSelectChange}
          value={this.state.skillsMulti}
          placeholder="Select or type skills to add"
          suggestions={this.state.suggestions}
        />
        <form onSubmit={this.handleSubmit}>
          <Button type="submit" variant="contained" size="small">
              <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Save
          </Button>
        </form>
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={this.state.saveNotificationOpen}
            //autoHideDuration={6000}
            onClose={this.handleNotificationClose}
        >
            <MySnackbarContentWrapper
                onClose={this.handleNotificationClose}
                variant={this.state.notificationVariant}
                message={this.state.notificationMessage}
            />
        </Snackbar>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(ManageSkillContainer));