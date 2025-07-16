// import Message from "../assets/Message";
// import ListGroup from "./ListGroup";
// import Alert from "./Alert";
// import Button from "./Button";
// let items = ["New York", "San Francisco", "Tokyo", "London", "Paris"];

// const handleSelectItem = (item: string) => {
//   console.log("Clicked");
// };

// function App() {
//   //return <div><ListGroup items={items} heading="Cities" onSelectItem={handleSelectItem}/></div>;
//   /*return (
//     <Alert>
//       Hello <span>World</span>
//     </Alert>
//   );
//   */
//   return (
//     <Button onClick={() => console.log("Clicked")} color="secondary">
//       Submit
//     </Button>
//   );
// }

import "./App.css";
import Homepage from "./Homepage/Homepage";

function App() {
  return <Homepage />;
}

export default App;
