import React from 'react';

const CommitteeForm = ({ 
  formData, 
  users, 
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
          value={formData.committeeName}
          onChange={(e) => onChange('committeeName', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Committee Purpose:</label>
        <input
          type="text"
          value={formData.committeePurpose}
          onChange={(e) => onChange('committeePurpose', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Chairman:</label>
        <select
          value={formData.chairman.email}
          onChange={(e) => {
            const selectedUser = users.find(user => user.email === e.target.value);
            onChange('chairman', {
              name: `${selectedUser.fullname.firstname} ${selectedUser.fullname.lastname}`,
              email: selectedUser.email,
              contactNumber: ""
            });
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
          value={formData.convenor.email}
          onChange={(e) => {
            const selectedUser = users.find(user => user.email === e.target.value);
            onChange('convenor', {
              name: `${selectedUser.fullname.firstname} ${selectedUser.fullname.lastname}`,
              email: selectedUser.email,
              contactNumber: ""
            });
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
          <MemberInput 
            key={index}
            member={member}
            onChange={(field, value) => onChange('members', formData.members.map((m, i) => 
              i === index ? { ...m, [field]: value } : m
            ))}
          />
        ))}
        <button type="button" className="addmemberbtn" onClick={onAddMember}>
          Add Member
        </button>
      </div>

      <button type="submit" className="committeebtn">
        Create Committee
      </button>
    </form>
  );
};

export default CommitteeForm;