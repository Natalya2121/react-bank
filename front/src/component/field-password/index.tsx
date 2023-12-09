import "./index.css";
import React from "react"; 

interface FieldProps {
	action: (e: React.FormEvent<HTMLInputElement>) => void;
	name: string; 
	label:string;
	type:string;
	placeholder:string;
	value:string;
};

export const FieldPassword: React.FC<FieldProps> = ({ action, name, label, type, placeholder, value }) => {
	const handleToggle = (e: React.FormEvent<HTMLElement>) => {
		e.currentTarget.toggleAttribute('show');

		const input = e.currentTarget.previousElementSibling;

		if (input) {
	
		const type = input.getAttribute('type');
	
		if (type === 'password') {
		  input.setAttribute('type', 'text')
		} else {
		  input.setAttribute('type', 'password')
		}
	}

	};

	return (
		<div className="field field--password">
		<label htmlFor={name} className="field__label">{label}</label>
	
		<div className="field__wrapper">
			<input onInput={action} type="password" className="field__input validation" name={name} value={value} placeholder={placeholder}/>
			<span onClick={handleToggle} className="field__icon"></span>
		</div>
	</div>

);
};
