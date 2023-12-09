import "./index.css";
import { Link } from "react-router-dom";

export default function Container() {
  return (
    <div className="page-wellcome page--background">
      <div className="page__titles">
        <h1 className="page__title1">Hello!</h1>
        <h2 className="page__title2">Welcome to bank app</h2>
      </div>
      <div className="page--background2"></div>
      <div className="page__buttons">
        <Link className="page__button" to="/signup">
          Sign Up
        </Link>
        <Link className="page__button page__button--white" to="/signin">
          Sign In
        </Link>
      </div>
    </div>
  );
}
