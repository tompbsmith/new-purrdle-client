import useSWR from 'swr'

import Layout from '../components/layout';
import { ICat, Cat } from '../components/cat';
import { Guesses } from '../components/guesses';

import React, { useState, useEffect, Component } from "react";
import { ifError } from 'assert';

import styles from './index.module.scss';

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

const fetcher = (url: URL) => fetch(url).then((res) => res.json())

interface ICatRaw {
  name: string,
  mainImage: string,
  images: string[],
  details: {},
  url: string
}

const Index = (props: any) => {

  function getTodaysCat(cats: ICatRaw[]): ICat {
    let today = new Date();

    let c = cats[20];

    console.log(c.name);

    return {
      name: cats[20].name,
      images: [cats[20].mainImage, ...cats[20].images],
      details: cats[20].details,
      url: cats[20].url
    }
  }

  function takeTurn(guess: string) {
    setCurrentGuess(guess);
    console.log(currentGuess);

    let currentCorrect = compareGuess();
    console.log(currentCorrect);

    setGuesses(guesses => [...guesses, currentGuess])
    setCorrects(corrects => [...corrects, currentCorrect])

    //update hint
    let h = [];
    let hf = hintFlags;
    console.log("hint flags");
    console.log(hintFlags)
    let trimmedName = cat.name.trim();
    for (let i = 0; i < trimmedName.length; i++) {
      if (!hf[i]) {
        console.log("looking for: " + trimmedName[i]);
        let flag = false;
        for (let j = 0; j < currentGuess.length; j++) {
          if (trimmedName[i] === " ") {
            console.log("is space");
            h.push(" ");
            flag = true;
            break;
          } else if (trimmedName[i] === "-") {
            h.push("-");
            flag = true;
            break;
          } else if (currentGuess[j].toLowerCase() === trimmedName[i].toLowerCase()) {
            console.log("found!");

            h.push(trimmedName[i])
            hf[i] = true

            flag = true;
            break;
          }
        }

        if (!flag) {
          h.push("_");
          console.log("no flag")
        }
      } else {
        h.push(trimmedName[i]);
      }
    }
    console.log(h)
    console.log(hf)
    setHint(h)
    setHintFlags(hf)

    if (currentGuess.toLowerCase() === cat.name.toLowerCase().trim()) {
      setShowWin(true)
      return;
    }

    setTurnNumber(turnNumber + 1);

    console.log("turn Number: " + turnNumber);

    if (turnNumber == 4) {
      setShowLose(true);
      return;
    }
  }

  function compareGuess(): number[] {
    let corrects = [];

    let trimmedName = cat.name.trim();
    // console.log("answer: :" + trimmedName)
    // console.log("guess: " + currentGuess);


    // console.log("comparing guess:");
    for (let j = 0; j < currentGuess.length; j++) {
      let flag = false;
      for (let i = 0; i < trimmedName.length; i++) {
        // console.log("comparing: " + currentGuess[j].toLowerCase() + " to: " + trimmedName[i].toLowerCase());
        if (trimmedName[i].toLowerCase() == currentGuess[j].toLowerCase()) {
          corrects.push(1);
          flag = true;
          // console.log("FOUND!")
          break;
        }
      }

      if (!flag) {
        corrects.push(0);
        // console.log("NOT FOUND!")
      }

    }

    return corrects;
  }

  let cats: ICatRaw[] = [];
  const { data, error } = useSWR('/api/staticdata', fetcher)

  useEffect(() => {
    if (data !== undefined) {
      cats = JSON.parse(data);

      let ca = getTodaysCat(cats);
      setCat(getTodaysCat(cats));

      //set hint
      let h = []
      let hf = []
      for (const c of ca.name) {
        if (c === " ") {
          h.push(" ");
          hf.push(true)
        } else if (c === "-") {
          h.push("-");
          hf.push(true)
        } else {
          h.push("_");
          hf.push(false)
        }


      }
      setHint(h)
      setHintFlags(hf)

      console.log(hint)
    }
  }, [data])


  let blankCat = {
    name: "Blank",
    images: [],
    details: {},
    url: "blank"
  }

  const baseUrl = "https://www.catbreedslist.com";

  const [currentGuess, setCurrentGuess] = useState("")
  const [turnNumber, setTurnNumber] = useState(0)
  const [guesses, setGuesses] = useState<string[]>([])
  const [corrects, setCorrects] = useState<number[][]>([])
  const [cat, setCat] = useState<ICat>(blankCat)
  const [hint, setHint] = useState<string[]>([])
  const [hintFlags, setHintFlags] = useState<boolean[]>([])
  const [showRules, setShowRules] = useState<boolean>(false)
  const [showWin, setShowWin] = useState<boolean>(false)
  const [showLose, setShowLose] = useState<boolean>(false)
  const [showLaura, setShowLaura] = useState<boolean>(false)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  //set laura card
  const windowUrl = window.location.search;
  console.log("windowUrl: " + windowUrl);

  return (
    <div>
      <Layout>
        {showRules &&
          <>
          </>
        }
        {showWin &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.win}>
              <h2>MEOW! <FontAwesomeIcon icon={faPaw} bounce /></h2>
              <img src="https://c.tenor.com/GwTRUJal39sAAAAd/cat-happy-cat.gif" />
              <h3>CORRECT in {turnNumber + 1} {(turnNumber + 1) === 1 ? "guess" : "guesses"}!</h3>
              <h3 className={styles.red}>The answer was <a style={{ textDecoration: "underline" }} href={baseUrl + cat.url} target="_blank" rel="noreferrer">{cat.name}</a>!</h3>
              <span className={styles.guesses}>Your Guesses:</span>
              <div className={styles.guessesList}>
                {guesses.map((item, i) => {
                  return <div key={i}>{i + 1}. {item}</div>
                })}
              </div>
            </div>
          </>
        }
        {showLose &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.lose}>
              <h2>Aww! <FontAwesomeIcon icon={faPaw} shake /></h2>
              <img src="https://s36537.pcdn.co/wp-content/uploads/2018/05/A-gray-cat-crying-looking-upset.jpg.optimal.jpg" />
              <h3 className={styles.red}>The answer was <a style={{ textDecoration: "underline" }} href={baseUrl + cat.url} target="_blank" rel="noreferrer">{cat.name}</a>!</h3>
              <span className={styles.guesses}>Your Guesses:</span>
              <div className={styles.guessesList}>
                {guesses.map((item, i) => {
                  return <div key={i}>{i + 1}. {item}</div>
                })}
              </div>
            </div>
          </>
        }
        <Cat name={cat.name} images={cat.images} details={cat.details} url={cat.url} turnNumber={turnNumber} />
        <Guesses turnNumber={turnNumber} takeTurn={takeTurn} currentGuess={currentGuess} setCurrentGuess={setCurrentGuess} guesses={guesses} corrects={corrects} hint={hint} />
      </Layout>
    </div>
  )
}

export default Index;