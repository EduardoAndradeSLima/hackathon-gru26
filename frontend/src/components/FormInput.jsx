export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  options = [],
  required = false,
  placeholder = '',
  as = 'input'
}) {
  const id = `field-${name}`;

  return (
    <label className="block" htmlFor={id}>
      <span className="form-label">{label}{required ? ' *' : ''}</span>
      {as === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} required={required} className="form-input">
          <option value="">Selecione</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea id={id} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={4} className="form-input py-3" />
      ) : (
        <input id={id} name={name} value={value} onChange={onChange} required={required} type={type} placeholder={placeholder} className="form-input" />
      )}
    </label>
  );
}
