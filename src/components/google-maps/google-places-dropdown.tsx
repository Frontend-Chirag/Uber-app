// "use client";
// import { usePlaces } from "@/hooks/usePlaces";
// import { useCurrentLocation } from "@/hooks/useCurrentLocation";
// import { Input } from "../ui/input";
// import { LoaderIcon, MapPin } from "lucide-react";
// import { Button } from "../ui/button";

// export const GooglePlacesDropdown = () => {
//     const {
//         ready,
//         value,
//         suggestions,
//         setValue,
//         handleSelect,
//         selectedPlace,
//         status,
//         isLoading: isPlacesLoading,
//         error: placesError,
//         isInitialized
//     } = usePlaces();

//     const {
//         location,
//         isLoading: isLocationLoading,
//         error: locationError,
//         updateLocation
//     } = useCurrentLocation();

//     const handleUseCurrentLocation = async () => {
//         try {
//             await updateLocation();
//             if (location) {
//                 const address = `${location.region}, ${location.country}`;
//                 setValue(address);
//                 await handleSelect(address);
//             }
//         } catch (error) {
//             console.error('Error using current location:', error);
//         }
//     };

//     return (
//         <div className="relative w-full">
//             <div className="relative flex gap-2">
//                 <Input
//                     type="text"
//                     value={value}
//                     onChange={(e) => setValue(e.target.value)}
//                     disabled={!isInitialized}
//                     placeholder={isInitialized ? "Search for locations..." : "Loading Google Maps..."}
//                     className="w-full pr-10"
//                 />
//                 <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={handleUseCurrentLocation}
//                     disabled={!isInitialized || isLocationLoading}
//                     className="shrink-0"
//                 >
//                     <MapPin className="h-4 w-4" />
//                 </Button>
//             </div>

//             {(isPlacesLoading || isLocationLoading) && (
//                 <LoaderIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
//             )}

//             {(placesError || locationError) && (
//                 <div className="mt-1 text-sm text-red-500">
//                     {placesError || locationError}
//                 </div>
//             )}

//             {status === 'OK' && suggestions.length > 0 && (
//                 <ul className="absolute bg-white border w-full mt-1 shadow-lg rounded-md z-10 max-h-60 overflow-auto">
//                     {suggestions.map((suggestion) => (
//                         <li
//                             key={suggestion.place_id}
//                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                             onClick={() => handleSelect(suggestion.description)}
//                         >
//                             {suggestion.description}
//                         </li>
//                     ))}
//                 </ul>
//             )}

//             {selectedPlace && (
//                 <div className="mt-2 text-sm text-gray-600">
//                     Selected Location: {selectedPlace.address}
//                 </div>
//             )}

//             {location && !selectedPlace && (
//                 <div className="mt-2 text-sm text-gray-600">
//                     Current Location: {location.region}, {location.country}
//                 </div>
//             )}
//         </div>
//     );
// };