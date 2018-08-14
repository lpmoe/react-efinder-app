import app from "../base";
const createReactClass = require('create-react-class');

const SkillUtil = createReactClass({
  statics: {
    getSkillsRef: function() {
      return app.database().ref('skills');
    },
    getUntrackedSkillsRef: function() {
      return this.getSkillsRef().child('untracked');
    },
    getUntrackedSkills: function(callingClass, key) {
      let untrackedSkillsRef = this.getUntrackedSkillsRef();
      let skillArr = [];
      untrackedSkillsRef.once('value', function(snap) {
        if (snap.exists()) {
          // Does a uniq check. Profile is not adding duplicates,
          // but no constraint on db end preventing a person with
          // direct access to firebase to add duplicate
          let skillSet = snap.val().filter((v, i, a) => a.indexOf(v) === i);
          for (let i = 0; i < skillSet.length; i++) {
            skillArr.push({ value: skillSet[i],
                            label: skillSet[i] });
          }
          callingClass.setState({[key] : skillArr});
        }
      })
    },
    setTrackedSkills: function(callingClass, key, asObj = false) {
      let skillSuggestionsRef = app.database().ref('skills');
      let that = this;
      skillSuggestionsRef.on('value', function(snap){
          var skillArr = [];
          snap.forEach(function(childNodes){
              let skillKey = childNodes.key;
              // Saving untracked key to skills. Only want number keys
              if (!isNaN(skillKey)) {
                let skillVal = childNodes.val();
                if (asObj) {
                  skillArr.push({ value: skillVal.name,
                                  label: skillVal.name });
                }
                else {
                  skillArr.push(skillVal.name);
                }
              }
          });
          if (asObj) {
            callingClass.setState({[key] : skillArr});
          }
          else {
            that.setSkillsMulti(callingClass, key, skillArr);
          }
      });
    },
    setSkillsMulti(callingClass, key, skillArr) {
      let skillsForMulti = [];
      for (let i = 0; i < skillArr.length; i++) {
          let valForMulti = {label : skillArr[i], value : skillArr[i]};
          // TODO - Need to determine if new
          let isNew = false;
          if (isNew) {
            valForMulti.__isNew__ = true;
          }
          skillsForMulti.push(valForMulti);
      }
      callingClass.setState({ [key] : skillsForMulti });
    },
    addUntrackedSkills(newSkills) {
      let untrackedSkillsRef = this.getUntrackedSkillsRef();
      untrackedSkillsRef.once('value', function(snap) {
        if (snap.exists()) {
          newSkills = newSkills.concat(snap.val()).filter((v, i, a) => a.indexOf(v) === i);
        }
        untrackedSkillsRef.set(newSkills);
      });
    }
  },
  render() {
    return
  },
});

export default SkillUtil;