import PropTypes from 'prop-types';

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
    </div>
  );
};

MemberInput.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default MemberInput;