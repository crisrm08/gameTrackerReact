import React, { useContext, useState } from "react";
import { ScreenContext } from '../contexts/ScreenContext';
import { LoggedContext } from "../contexts/LoggedContext";
import { MdLogout } from "react-icons/md";
import axios from "axios";

function Header(props) {
  const [searchInput, setSearchInput] = useState("");
  const { setCurrentScreen } = useContext(ScreenContext);
  const { setIsLoggedIn } = useContext(LoggedContext);

  function handleInputChange(event){
    setSearchInput(event.target.value);
  };

  function handleSubmit(event){
    event.preventDefault();
    if (searchInput.trim()) {
      props.onSearch(searchInput); 
      console.log("Input sent to App: " + searchInput);
      
      setSearchInput("");
    }
  };

  function logout() {
    axios.post("http://localhost:5000/logOut", {withCredentials: true});
    setCurrentScreen("login");
    setIsLoggedIn(false);
  }

  return (
    <header className="py-3 mb-3 border-bottom">
      <div className="container-fluid d-grid gap-3 align-items-center" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <div className="logo">
          <h1>Game Tracker</h1>
          <img src="/images/controller.svg" alt="controller image" />
        </div>

        <div className="d-flex align-items-center">
          <form className="w-100 me-3" role="search" onSubmit={handleSubmit}>
            <input
              type="search"
              className="form-control"
              placeholder="Search for a game..."
              aria-label="Search"
              value={searchInput}
              onChange={handleInputChange}
            />
          </form>
          <MdLogout onClick={logout} />
        </div>
      </div>
    </header>
  );
}

export default Header;
