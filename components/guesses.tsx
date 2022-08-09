import styles from './guesses.module.scss';

import React, { useState } from 'react';
import parse from "html-react-parser";

export interface ICat {
    name: string,
    images: string[],
    details: {},
    url: string
}

const baseUrl = "https://www.catbreedslist.com";

export const Guesses = ({ takeTurn, turnNumber, currentGuess, setCurrentGuess, guesses, corrects, hint }: any) => {
    const [showHint, setShowHint] = useState(false);

    let previousGuesses = corrects.map((correct: number[], i: number) => {
        let answer = correct.map((c: number, j: number) => {
            return <span style={{ color: (c === 1) ? 'green' : 'red' }}>{guesses[i][j]}</span>
        })

        return <div className={styles.guess}>{answer}</div>
    })

    let hintHTML = hint.map((item: string) => {
        if (item === " ") {
            return <span className={styles.hintSpace}></span>
        } else {
            return <span className={styles.hintLetter}>{item} </span>
        }
    })


    let hintTest = <span>hello</span>;
    let hintTest2 = <span>hello2</span>;

    return (<>
        {turnNumber < 5
            ?
            (
                <>
                    <button>Show Rules</button><button onClick={() => setShowHint(!showHint)}>{showHint ? "Hide" : "Show"} Hint</button>
                    {showHint ? <div className={styles.hint}>{hintHTML}</div> : null}
                    <ul className={styles.layout}>
                        <div>{previousGuesses}</div>
                        <input type="text" className={styles.input} value={currentGuess} onChange={event => setCurrentGuess(event.target.value)} />
                        <button onClick={() => takeTurn(currentGuess)}>Guess</button>
                    </ul>
                </>
            )
            :
            (
                <div>Game Over</div>
            )
        }
    </>
    )
}