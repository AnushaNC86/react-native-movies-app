import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getSavedMovies } from "@/services/appWrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
const Saved = () => {
  const router = useRouter();

  const {
    data: savedMovies,
    loading: savedLoading,
    error: savedErr,
    refetch: refetchSavedMovies,
  } = useFetch(() => getSavedMovies());

  useFocusEffect(
    useCallback(() => {
      refetchSavedMovies();
    }, [])
  );

  const renderHeader = () => (
    <View className="px-5 ">
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
      <SearchBar
        onPress={() => router.push("/search")}
        placeholder="Search for a movie"
      />
      <Text className="text-lg font-bold my-4 text-white">Saved Movies</Text>
    </View>
  );

  if (savedLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#00f" />
      </View>
    );
  }

  if (savedErr) {
    return (
      <View className="flex-1 justify-center items-center bg-primary px-5">
        <Text className="text-white text-center">
          Error: {savedErr?.message}
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
      {savedMovies && (
        <FlatList
          data={savedMovies}
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
          ListEmptyComponent={
            !savedLoading && !savedErr ? (
              <View className="mt-10 px-5">
                <Text className="text-center text-gray-500">
                  {savedMovies?.length <= 0
                    ? "You don't have any saved movies yet"
                    : ""}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default Saved;
