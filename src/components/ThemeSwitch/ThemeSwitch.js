import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './ThemeSwitch.css';
const ThemeSwitch = ({ id, switchClass, sliderClass }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <label className={`switch ${switchClass}`}>
      <input
        type="checkbox"
        id={id}
        onChange={toggleTheme}
        checked={theme === 'dark'}
      />
      <span className={`slider round ${sliderClass}`}></span>
    </label>
  );
};

export default ThemeSwitch;
