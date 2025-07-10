const CommitteeForm = ({ 
  formData = {
    committeeName: '',
    committeePurpose: '',
    chairman: { name: '', email: '' },
    convener: { name: '', email: '' },
    members: []
  }, 
  users = [], 
  onSubmit, 
  onChange, 
  onAddMember 
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Committee Name:</label>
        <input
          type="text"  
          value={formData.committeeName || ''}
          onChange={(e) => onChange('committeeName', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Committee Purpose:</label>
        <input
          type="text"
          value={formData.committeePurpose || ''}
          onChange={(e) => onChange('committeePurpose', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Chairman:</label>
        <select
          value={formData.chairman?.email || ''}
          onChange={(e) => {
            const selectedUser = users.find(user => user.email === e.target.value);
            if (selectedUser) {
              onChange('chairman', {
                name: `${selectedUser.fullname.firstname} ${selectedUser.fullname.lastname}`,
                email: selectedUser.email
              });
            }
          }}
          required
        >
          <option value="">Select Chairman</option>
          {users.map((user) => (
            <option key={user._id} value={user.email}>
              {user.fullname.firstname} {user.fullname.lastname} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Convenor:</label>
        <select
          value={formData.convener?.email || ''}
          onChange={(e) => {
            const selectedUser = users.find(user => user.email === e.target.value);
            if (selectedUser) {
              onChange('convener', {
                name: `${selectedUser.fullname.firstname} ${selectedUser.fullname.lastname}`,
                email: selectedUser.email
              });
            }
          }}
          required
        >
          <option value="">Select Convenor</option>
          {users.map((user) => (
            <option key={user._id} value={user.email}>
              {user.fullname.firstname} {user.fullname.lastname} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Members:</label>
        {formData.members.map((member, index) => (
          <div key={index} className="member-select">
            <select
              value={member.email || ''}
              onChange={(e) => {
                const selectedUser = users.find(user => user.email === e.target.value);
                if (selectedUser) {
                  const updatedMembers = [...formData.members];
                  updatedMembers[index] = {
                    ...updatedMembers[index],
                    name: `${selectedUser.fullname.firstname} ${selectedUser.fullname.lastname}`,
                    email: selectedUser.email
                  };
                  onChange('members', updatedMembers);
                }
              }}
              required
            >
              <option value="">Select Member</option>
              {users
                .filter(user => 
                  user.email !== formData.chairman?.email && 
                  user.email !== formData.convener?.email &&
                  !formData.members.some((m, i) => i !== index && m.email === user.email)
                )
                .map((user) => (
                  <option key={user._id} value={user.email}>
                    {user.fullname.firstname} {user.fullname.lastname} ({user.email})
                  </option>
                ))
              }
            </select>
            { /* Removed role select: All added members are normal members by default */}
            <button 
              type="button" 
              className="remove-member"
              onClick={() => {
                const updatedMembers = formData.members.filter((_, i) => i !== index);
                onChange('members', updatedMembers);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="addmemberbtn" onClick={() => onAddMember()}>
          Add Member
        </button>
      </div>

      <button type="submit" className="committeebtn">
        Create Committee
      </button>
    </form>
  );
};

import PropTypes from 'prop-types';

CommitteeForm.propTypes = {
  formData: PropTypes.shape({
    committeeName: PropTypes.string,
    committeePurpose: PropTypes.string,
    chairman: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string
    }),
    convener: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string
    }),
    members: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string
      })
    )
  }),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      fullname: PropTypes.shape({
        firstname: PropTypes.string.isRequired,
        lastname: PropTypes.string.isRequired
      }).isRequired
    })
  ),
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onAddMember: PropTypes.func
};

export default CommitteeForm;