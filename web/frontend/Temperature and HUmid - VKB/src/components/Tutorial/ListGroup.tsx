//import { Fragment } from "react"; //To return more than 1 object
//OR just simply wrap the code with <></> to notify React that this is a fragment

import { useState } from "react";

interface ListGroupProps {
  items: string[];
  heading: string;
  //Function to notify that an item is selected
  //(item: string) => void
  onSelectItem: (item: string) => void; //onClick
}

function ListGroup({ items, heading, onSelectItem}: ListGroupProps) {
  /*
  You call useState(initialValue).
  - It returns an array: [state, setState].
    - state is the current value.
    - setState is a function to update the value.
  */
  const [selectedIndex, setSelectedIndex] = useState(-1);

  //{items.map(item => <li>{item}</li>) //Convert each item in the list to be wraped with li tag

  return (
    </*Fragment*/>
      <h1>{heading}</h1>
      {items.length === 0 && <p>No item found</p>}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={item}
            onClick={() => {
              setSelectedIndex(index);
              onSelectItem(item);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </ /*Fragment*/>
  );
}

export default ListGroup;
