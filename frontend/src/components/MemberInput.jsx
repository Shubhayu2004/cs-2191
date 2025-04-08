import React from 'react';

const MemberInput = ({ member, onChange }) => {
  return (
    <div className="member-inputs">
      <input
        type="text"
        placeholder="Name"
        value={member.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={member.email}
        onChange={(e) => onChange('email', e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Contact Number"
        value={member.contactNumber}
        onChange={(e) => onChange('contactNumber', e.target.value)}
        required
      />
    </div>
  );
};

export default MemberInput;