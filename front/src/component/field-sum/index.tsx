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

export const FieldSum: React.FC<FieldProps> = ({ action, name, label, type, placeholder, value }) => {

	return (
		<div className="field">
		<label htmlFor={name} className="field__label">{label}</label>
	
		<div className="fieldsum__wrapper">
			<input onInput={action} type={type} className="field__input validation" name={name} value={value} placeholder={placeholder}/>
			<span className="fieldsum__icon">$</span>
		</div>
	</div>

);
};
