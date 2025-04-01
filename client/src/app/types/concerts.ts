export interface Artist {
    id: number;
    name: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface UserSocials {
    instagram: string;
    discord: string;
}

export interface UserProfile {
    profile_photo: string;
    favorite_artists: Artist[];
    favorite_genres: Genre[];
    term: string;
    faculty: string;
    user_socials: UserSocials;
}

export interface UserData {
    id: number;
    username: string;
    email?: string;
    profile: UserProfile;
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
    info: string;
    _embedded: {
        venues: Array<object>
    }
}
