import "./index.css";
import React from "react";
import {useNavigate} from "react-router-dom";
  

export const BackButton: React.FC = () => {
	const navigate = useNavigate();	
	const handleClick = () => navigate(-1);
	
return	 (
	  <div className="back-button" onClick={handleClick}></div>
	);
};
  
  
