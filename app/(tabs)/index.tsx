import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appWrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import TrendingCard from "../components/TrendingCard";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingErr,
    refetch: fetchTrendingMovies,
  } = useFetch(() => getTrendingMovies());

  useFocusEffect(
    useCallback(() => {
      fetchTrendingMovies();
    }, [])
  );

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  const isLoading = moviesLoading || trendingLoading;
  const hasError = moviesError || trendingErr;

  const renderHeader = () => (
    <View className="px-5">
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
      <SearchBar
        onPress={() => router.push("/search")}
        placeholder="Search for a movie"
      />
      {trendingMovies && (
        <View className="mt-10">
          <Text className="text-lg font-bold mb-3 text-white">
            Trending Movies
          </Text>
          <FlatList
            contentContainerStyle={{ paddingRight: 20 }}
            horizontal
            data={trendingMovies}
            renderItem={({ item, index }) => (
              <TrendingCard movie={item} index={index} />
            )}
            keyExtractor={(item) => item.movie_id.toString()}
            ItemSeparatorComponent={() => <View className="w-8 " />}
            showsHorizontalScrollIndicator={false}
            className="mb-4 mt-3"
            ListEmptyComponent={
              !trendingLoading && !trendingErr ? (
                <View className="mt-10 px-5">
                  <Text className="text-center text-gray-500">
                    {trendingMovies?.length <= 0
                      ? "You don't have any saved movies yet"
                      : ""}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}
      <Text className="text-lg text-white mt-5 mb-3 font-bold">
        Latest Movies
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#00f" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center bg-primary px-5">
        <Text className="text-white text-center">
          Error: {moviesError?.message || trendingErr?.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <MovieCard {...item} />}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 20,
          paddingHorizontal: 5,
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
