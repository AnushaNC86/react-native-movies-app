import { icons } from "@/constants/icons";
import { Image, TextInput, View } from "react-native";

interface Props {
  placeholder: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  value?: string;
}

const SearchBar = ({ placeholder, onPress, value, onChangeText }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-3 ">
      <Image
        source={icons.search}
        className="size-5"
        tintColor="#ab8bff"
        resizeMode="contain"
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A8B5DB"
        value={value}
        className="flex-1 ml-2  text-white"
        onPress={onPress}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default SearchBar;
