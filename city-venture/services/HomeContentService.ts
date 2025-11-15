import axios from 'axios';
import api from '@/services/api';

export type HighlightedTouristSpot = {
  id: string;
  name: string;
  image: string;
  barangay?: string;
  rating?: number;
  reviews?: number;
};

export type PartnerBusiness = {
  id: string;
  name: string;
  image: string;
  category: string;
  isVerified?: boolean;
};

export type HomeEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  publishedAt: string;
};

export const fetchHighlightedSpots = async (): Promise<HighlightedTouristSpot[]> => {
  const { data } = await axios.get(`${api}/home/highlighted-spots`);
  return data;
};

export const fetchPartnerBusinesses = async (): Promise<PartnerBusiness[]> => {
  const { data } = await axios.get(`${api}/home/partner-businesses`);
  return data;
};

export const fetchUpcomingEvents = async (): Promise<HomeEvent[]> => {
  const { data } = await axios.get(`${api}/home/upcoming-events`);
  return data;
};

export const fetchNewsArticles = async (): Promise<NewsArticle[]> => {
  const { data } = await axios.get(`${api}/home/news`);
  return data;
};
