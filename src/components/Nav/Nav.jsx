import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUser } from "react-icons/fa";
import { useLogout } from '../../hooks/useLogout';
import { useAuthContext } from '../../hooks/useAuthContext';
import './Nav.css';

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useLogout();
  const { isAuthenticated, userLogin } = useAuthContext();

  const handleLogOut = () => {
    logout();
  };

  return (
    <div className="nav-bar">
      <div className="logo">
        <NavLink to='/'><h1><span className="z">Z</span><span className="coder">coder</span></h1></NavLink>
      </div>
      <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
        <a href="#"><GiHamburgerMenu /></a>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        <li><NavLink to='/contests'>Contests</NavLink></li>
        <li><NavLink to='/practice'>Practice</NavLink></li>
        <li><NavLink to='/bookmarks'>Bookmarks</NavLink></li>
        {
          isAuthenticated ? 
            <>
              <li><NavLink to='/profile'>{userLogin.result.username}</NavLink></li>
              <li><NavLink to='/login' onClick={handleLogOut}>Logout</NavLink></li>
            </>
          :
            <>
              <li><NavLink to='/login'>Login</NavLink></li>
              <li><NavLink to='/signup'>Signup</NavLink></li>
            </>
        }
      </ul>
    </div>
  );
};

export default Nav;
