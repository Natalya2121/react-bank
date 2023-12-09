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

export const Field: React.FC<FieldProps> = ({ action, name, label, type, placeholder, value }) => {
	return (<div className="field">
	<label htmlFor={name} className="field__label">{label}</label>
	<input onInput={action} type={type} className="field__input validation" name={name} placeholder={placeholder} value={value}/>
</div>
);
};
