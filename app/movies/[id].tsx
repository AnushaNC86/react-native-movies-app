import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/api";
import { deleteSavedMovie, isMovieSaved, saveMovie } from "@/services/appWrite";
import useFetch from "@/services/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}
const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-200 font-bold text-sm mt-2">
      {value ?? "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const [disableSave, setDisableSave] = useState(false);
  const { id } = useLocalSearchParams();
  const {
    data: isSaved,
    loading: savedLoading,
    error: savedErr,
    refetch: loadMovies,
  } = useFetch(() => isMovieSaved(id as string));

  const {
    loading: unsaveLoading,
    error: unsaveError,
    refetch: handleUnsave,
  } = useFetch(() => deleteSavedMovie(id as string), false);

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const saveMovies = async () => {
    setDisableSave(true);

    try {
      await saveMovie(movie); // Assuming this saves the movie to DB
      await loadMovies(); // Refresh the saved movies list
    } catch (error) {
      console.error("Failed to save movie:", error);
      // Optionally show a toast/snackbar or feedback to the user here
    } finally {
      setDisableSave(false); // Ensures button is re-enabled even on error
    }
  };

  const deleteFromSaved = async () => {
    try {
      await handleUnsave();
      await loadMovies(); // Refetch saved status
    } catch (err) {
      console.error("Failed to unsave movie:", err);
    }
  };

  return (
    <View className="bg-primary flex-1">
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="mt-10 flex-1 items-center justify-center"
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
              }}
              className="w-full h-[550px]"
              resizeMode="stretch"
            />
          </View>
          <View className="flex-col items-start justify-center mt-5 px-5">
            <Text className="text-white text-xl font-bold">
              {movie?.title}{" "}
            </Text>
            <View className="flex-row items-center gap-x-1 mt-2">
              <Text className="text-light-200 text-sm">
                {movie?.release_date?.split("-")[0]}
              </Text>
              <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
            </View>
            <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
              <Image source={icons.star} className="size-4" />
              <Text className="text-white font-bold text-sm">
                {Math.round(movie?.vote_average ?? 0)}/10
              </Text>
              <Text className="text-light-200 text-sm">
                {" "}
                ({movie?.vote_count} votes)
              </Text>
            </View>
            <MovieInfo label="Overview" value={movie?.overview} />
            <MovieInfo
              label="Genres"
              value={movie?.genres?.map((g) => g.name).join(" - ") ?? "N/A"}
            />
            <View className="flex flex-row justify-between w-1/2">
              <MovieInfo
                label="Budget"
                value={
                  movie?.budget
                    ? `$${movie?.budget / 1_000_000} million`
                    : "$0 million"
                }
              />
              <MovieInfo
                label="Revenue"
                value={`$${Math.round(movie?.revenue ?? 0) / 1_000_000}`}
              />
            </View>
            <MovieInfo
              label="Production Companies"
              value={
                movie?.production_companies?.map((c) => c.name).join(" - ") ??
                "N/A"
              }
            />
          </View>
        </ScrollView>
      )}

      <View className="absolute bottom-5 left-0 right-0 mx-5 flex-row justify-between z-50 gap-x-3">
        {/* Go Back Button */}
        <TouchableOpacity
          className="flex-1 bg-accent rounded-lg py-3.5 flex-row items-center justify-center"
          onPress={router.back}
        >
          <Image
            source={icons.arrow}
            className="size-5 mr-1 mt-0.5 rotate-180"
            tintColor="#fff"
          />
          <Text className="text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
        {/* Add to Favorites Button */}
        <TouchableOpacity
          className="flex-1 bg-yellow-600 rounded-lg py-3.5 flex-row items-center justify-center"
          onPress={isSaved ? deleteFromSaved : saveMovies}
          disabled={disableSave}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color="white"
            className="mr-1"
          />
          <Text className="text-white font-semibold text-base">
            {(() => {
              if (unsaveLoading || savedLoading) return "Loading...";
              return isSaved ? "Unsave Movie" : "Save Movie";
            })()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;
