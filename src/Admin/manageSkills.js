import React, { Component } from "react";
import { withRouter } from "react-router";
import CustomReactSelect from '../customReactSelect'
import SkillUtil from '../util/skillUtil'

class ManageSkillContainer extends Component {
  state = {
    skills : [],
    newSkills : [],
    skillsMulti : null,
    suggestions : []
  };

  handleCustomSelectChange = this.handleCustomSelectChange.bind(this);

  componentWillMount(){
    SkillUtil.getUntrackedSkills(this, 'suggestions');
    SkillUtil.setTrackedSkills(this, 'skillsMulti');
  }

  handleCustomSelectChange(key, value) {
    let skillsArr = [];
    let newSkillsArr = [];
    for (let i = 0; i < value.length; i++) {
        skillsArr.push(value[i].label);
        if (value[i].__isNew__) {
            newSkillsArr.push(value[i].label);
        }
    }
    this.setState({ [key]: value,
                    skills: skillsArr,
                    newSkills : newSkillsArr });
  }

  render() {
    return (
      <div>
        <CustomReactSelect
          id='skillsMulti'
          onChange={this.handleCustomSelectChange}
          value={this.state.skillsMulti}
          placeholder="Select or type skills to add"
          suggestions={this.state.suggestions}
        />
      </div>
    );
  }
}

export default withRouter(ManageSkillContainer);