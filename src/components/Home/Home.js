import { useEffect, useState } from "react";
import { OPENAI_KEY } from "../../keys";
import "./Home.css";
import OpenAI from "openai";
import ClipLoader from "react-spinners/ClipLoader";

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

const restaurant = {
  name: "Tadich Grill",
  reviews: [
    {
      body: "One of our favorite restaurant in San Francisco. Great food, great service and great atmosphere. No reservations? No problem. We sat on the bar and enjoyed a great meal with Brian serving and entertaining us.",
      reccomendedDishes: "Tadich Famous Seafood Cioppino",
    },
    {
      body: "We had a great visit!  The good was delicious and the service was outstanding!  Our waiter Jure was the best.  Highly recommended!",
      reccomendedDishes: "Tadich Famous Seafood Cioppino",
    },
    {
      body: "This place is a relic. You can go to Michelin star restaurants but this is old California. Sand Dabs, Branzino, artichoke, and prawn cocktail. Juri our waiter was a CIA  graduate from Hyde Park. It was a great experience.",
      reccomendedDishes:
        "Tadich Sourdough Loaf if Available, Mediterranean White Branzino Sea Bass, Sand Dabs",
    },
    {
      body: "I understand why they are the oldest restaurant in California. Amazing seafood and your choice for it to be cooked in a few ways. So many choices. We shared the appetizers and even then the portions were so large but every bite was delicious. I ordered the Chilean sea bass which was nicely charbroiled and cooked to perfection. The sauce wasn’t heavy at all which made the fish shine! Even the rice and vegetables it came with were splendid. Order their sourdough and Bloody Mary!  And my goodness their bread pudding and even their berries and fruit and chocolate cake seemed simple but tasted Amazing. The menu is extensive but they can take the simpler things and make it amazingly well. I even had the lucky opportunity to have it for lunch during my trip and their clam chowder is also to die for! The atmosphere was great too. Still old school style. Staff had their uniforms on and they just have that old time feel. Reserve your tables! Each comes with a booth which can make for a nice intimate meal.",
      reccomendedDishes: "",
    },
    {
      body: "The overall atmosphere is old school in a good way. You feel the history and pride for sure. The cioppino is one of the best I have tasted on this Sam Francisco trip. But, it is way more expensive than it should be. I just can't justify paying over $50 (before tax and tip) for a smallish bowl of seafood. Unless the price is adjusted, I won't be coming back or recommending this place to my friends.",
      reccomendedDishes: "Tadich Famous Seafood Cioppino",
    },
  ],
};

function Home() {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [response, setResponse] = useState({ sentiment: "", dishes: "" });
  let [search, setSearch] = useState({place: "test"});
  let [location, setLocation] = useState({location: ""});
  function getSentiment() {
    let contentString = "";
    for (const review of restaurant.reviews) {
      contentString += review.body;
    }
    return openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Give the a summary of the general sentiment of the restaurant with the following reviews: " +
            contentString,
        },
      ],
      model: "gpt-3.5-turbo",
    });
  }
  function notableDishes() {
    let contentString = "";
    for (const review of restaurant.reviews) {
      contentString += review.reccomendedDishes;
    }
    return openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Give a breakdown of the reccomended dishes with a brief description of each dish with a new line character separating each item and a number in front of each item and do not give notes and do not repeat items: " +
            contentString,
        },
      ],
      model: "gpt-3.5-turbo",
    });
  }
  useEffect(() => {
    const main = async () => {
      let [sentiment, dishes] = await Promise.all([
        getSentiment(),
        notableDishes(),
      ]);
      sentiment = sentiment.choices[0].message.content;
      dishes = dishes.choices[0].message.content;
      setResponse({
        sentiment: sentiment,
        dishes: dishes.replace(/ *\([^)]*\) */g, ""),
      });
      setLoading(false);
      console.log(sentiment);
      console.log(dishes);
    };
    main();
  }, []);

  function handleSubmit(event) {
    setLocation(search);
    // console.log(search.place.value)
    // alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  function handleChange(event) {
    setSearch(event.target.value);
    console.log(search);
  }

  return (
    <div className="center-horizontal">
      <section className="flex-container">
        <div className="image-group">
          <div className="title">
            <img className="search-bear-icon" src="./search-bear.png"></img>
            <span>Rate-It</span>
          </div>
          {/* <input className="location-box" value="Restaurant Name"></input> */}
          <form onSubmit={handleSubmit}>
            <input type="text" value={search.place} onChange={handleChange} className="location-box"/>
            {/* <input type="submit" value="Submit" /> */}
          </form>
          {/* <img className="res-image" src="./testimage.jpg"/> */}
          <iframe width="600" className="res-image" height="450" loading="lazy" allowfullscreen
            src={`https://www.google.com/maps/embed/v1/place?q=${location}&key=AIzaSyBXVuclOKs8BC2ru7PfGinjwcd2CcOpcbQ`}>
          </iframe>
          <div className="consensus-container">
           <h2><img className="icon" src="./chat-bubble-icon.svg"></img>General Consensus
            <ClipLoader
              color={color}
              loading={loading}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
           </h2>
            <span className="consensus">{response.sentiment}</span>
          </div>
        </div>
        <div className="flex-row">
          <div className="dishes-container">
            <h2><img className="icon" src="./note-icon.svg"></img>Notable Dishes
            <ClipLoader
              color={color}
              loading={loading}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            </h2>
            <div className="dishes-list">
                {response.dishes.split("\n").map((s) => {
                  return <span>{s}</span>;
                })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
