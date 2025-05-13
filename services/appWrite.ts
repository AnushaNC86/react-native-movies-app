import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVE_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// track the searches made by a user
export const updateSearchCount = async (query: string, movie: Movie | null) => {
  if (!query || !movie) {
    console.warn("Missing query or movie");
    return;
  }

  try {
    // List documents with the matching searchTerm
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    // If document exists, update the search count
    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        { count: existingMovie.count + 1 }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        count: 1,
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Appwrite error:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const saveMovie = async (movie: MovieDetails | null | undefined) => {
  if (!movie) {
    console.warn("Missing movie data");
    return;
  }
  console.log("movie.id", movie.id);

  try {
    // Check if movie already saved
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVE_COLLECTION_ID,
      [Query.equal("movie_id", movie.id)]
    );

    if (result.documents.length > 0) {
      console.log("Movie already saved.");
      return;
    }

    // Save entire movie object in JSON field
    await database.createDocument(
      DATABASE_ID,
      SAVE_COLLECTION_ID,
      ID.unique(),
      {
        movie_id: movie.id,
        movie_data: JSON.stringify(movie), // Store the entire object here
      }
    );
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const getSavedMovies = async () => {
  try {
    const response = await database.listDocuments(
      DATABASE_ID,
      SAVE_COLLECTION_ID
    );

    // Parse the stringified movie_data field back into objects
    const movies = response.documents.map((doc) => {
      try {
        return JSON.parse(doc.movie_data); // Assuming stored as string
      } catch (e) {
        console.warn("Invalid movie_data format in document:", doc.$id);
        return null;
      }
    });

    // Filter out any parsing failures
    return movies.filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch saved movies:", error);
    return [];
  }
};

export const isMovieSaved = async (movieId: number | string) => {
  if (!movieId) return false;

  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVE_COLLECTION_ID,
      [
        Query.equal("movie_id", Number(movieId)), // Convert to string if needed
      ]
    );

    return result.documents.length > 0;
  } catch (error) {
    console.error("Error checking saved movie:", error);
    return false;
  }
};

export const deleteSavedMovie = async (
  movieId: number | string | undefined
) => {
  if (!movieId) return;

  try {
    // First, fetch the saved movie document
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVE_COLLECTION_ID,
      [Query.equal("movie_id", Number(movieId))]
    );

    if (result.documents.length === 0) {
      console.warn("No saved movie found to delete.");
      return;
    }

    const documentId = result.documents[0].$id;

    // Delete the document
    await database.deleteDocument(DATABASE_ID, SAVE_COLLECTION_ID, documentId);

    console.log("Movie unsaved successfully.");
  } catch (error) {
    console.error("Error deleting saved movie:", error);
  }
};
