import { useState } from 'react';

export const TokenAndUuidHandler = () => {
  const token = localStorage.getItem('idToken');
  const uuid = localStorage.getItem('uuid');

  return <ul>
    <li>Token: <input value={token} onChange={e => localStorage.setItem('idToken', e.target.value)} /></li>
    <li>UUID: <input value={uuid} onChange={e => localStorage.setItem('uuid', e.target.value)} /></li>
  </ul>;
}

export const LocalStorageImporter = () => {
  const [value, setValue] = useState(JSON.stringify(localStorage));

  const reload = () => setValue(JSON.stringify(localStorage));

  return <div>LocalStorage : <input value={value} onChange={e => {
    let value = e.target.value;
    if (value.startsWith("'") || value.startsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.endsWith("'") || value.endsWith('"')) {
      value = value.slice(0, -1);
    }
    value = value.replace(/\\\\/g, '\\');
    console.log('Importing localStorage data:', value);
    localStorage.clear();
    const data = JSON.parse(value);
    for (const key in data) {
      localStorage.setItem(key, data[key]);
    }
    reload();
  }} />
    <button onClick={() => { localStorage.clear(); reload(); }} style={{ marginLeft: '10px' }}>
      Clear LocalStorage
    </button>
  </div>
}

export const ReloadButton = () => {
  const onClick = () => {
    window.location.reload();
  };

  return <button onClick={onClick} style={{ margin: '10px' }}>
    Reload
  </button>;
}