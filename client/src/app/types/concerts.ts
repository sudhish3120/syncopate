export interface UserData {
    user: {
        id: number;
        username: string;
    };
    status: string;
}

export interface Artist {
    id: number;
    name: string;
}

export interface Venue {
    id: number;
    name: string;
    address: string;
}

export interface ConcertDate {
    start: {
        localDate: string;
    };
}

export interface ConcertImage {
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
}

export interface Concert {
    id: number;
    name: string;
    artist: Artist;
    venue: Venue;
    dates: ConcertDate;
    url: string;
    images: Array<ConcertImage>;
}
