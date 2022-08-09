import styles from './cat.module.scss';

import { useState } from 'react';

export interface ICat {
    name: string,
    images: string[],
    details: {},
    url: string
}

const baseUrl = "https://www.catbreedslist.com";

export const Cat = ({ name, images, details, url, turnNumber }: any) => {
    const blurLevel = [
        20,
        10,
        5,
        2,
        0
    ];

    const [currentImage, setCurrentImage] = useState<string>(images[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    function changeImage() {
        if (currentImageIndex + 1 < images.length) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else {
            setCurrentImageIndex(0);
        }
    }

    return (
        name !== "Blank"
            ?
            <img onClick={() => changeImage()} className={styles.cat} style={{ filter: `blur(${blurLevel[turnNumber]}px)` }} src={"https://www.catbreedslist.com" + images[currentImageIndex]} />
            :
            <p>Loading...</p>
    )
}