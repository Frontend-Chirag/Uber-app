import { Hono } from "hono";
import { BaseResponseBuilder } from "../services/response-builder";

enum productType {
    NAVIGATION_ITEM_TYPE_RIDES = 'NAVIGATION_ITEM_TYPE_RIDES',
    NAVIGATION_ITEM_TYPE_UBER_RESERVE = 'NAVIGATION_ITEM_TYPE_UBER_RESERVE',
    NAVIGATION_ITEM_TYPE_INTERCITY = 'NAVIGATION_ITEM_TYPE_INTERCITY',
    NAVIGATION_ITEM_TYPE_HCV = 'NAVIGATION_ITEM_TYPE_HCV',
    NAVIGATION_ITEM_TYPE_RIDER_ITEM_DELIVERY = 'NAVIGATION_ITEM_TYPE_RIDER_ITEM_DELIVERY',
    NAVIGATION_ITEM_TYPE_HOURLY = 'NAVIGATION_ITEM_TYPE_HOURLY',
}

export type SuggestionType = {
    imageUrl: string,
    primaryText: string,
    secondaryText: string,
    type: string,
    url: string
};

const productSuggestions: SuggestionType[] = [
    {
        imageUrl: "https://cn-geo1.uber.com/static/mobile-content/Courier.png",
        primaryText: "Courier",
        secondaryText: "Uber makes same-day item delivery easier than ever.",
        type: "NAVIGATION_ITEM_TYPE_RIDER_ITEM_DELIVERY",
        url: "https://m.uber.com/go/connect/pickup"
    },
    {
        imageUrl: "https://mobile-content.uber.com/launch-experience/intercity.png",
        primaryText: "Intercity",
        secondaryText: "Get convenient, affordable outstation cabs anytime at your door.",
        type: "NAVIGATION_ITEM_TYPE_INTERCITY",
        url: "https://m.uber.com/looking/"
    },
    {
        imageUrl: "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png",
        primaryText: "Moto",
        secondaryText: "Get affordable motorbike rides in minutes at your doorstep.",
        type: "NAVIGATION_ITEM_TYPE_MOTO",
        url: "https://www.uber.com/ride/uber-moto/"
    },
    {
        imageUrl: "https://mobile-content.uber.com/launch-experience/Hourly2021.png",
        primaryText: "Rentals",
        secondaryText: "Request a trip for a block of time and make multiple stops.",
        type: "NAVIGATION_ITEM_TYPE_HOURLY",
        url: "https://m.uber.com/go/hourly/home"
    },
    {
        imageUrl: "https://mobile-content.uber.com/uber_reserve/reserve_clock.png",
        primaryText: "Reserve",
        secondaryText: "Reserve your ride in advance so you can relax on the day of your trip.",
        type: "NAVIGATION_ITEM_TYPE_UBER_RESERVE",
        url: "https://m.uber.com/reserve/"
    },
    {
        imageUrl: "https://mobile-content.uber.com/launch-experience/ride.png",
        primaryText: "Ride",
        secondaryText: "Go anywhere with Uber. Request a ride, hop in, and go.",
        type: "NAVIGATION_ITEM_TYPE_RIDES",
        url: "https://m.uber.com/looking/"
    },
    {
        imageUrl: "https://mobile-content.uber.com/launch-experience/hcv_shuttle.png",
        primaryText: "Shuttle",
        secondaryText: "Lower-cost shared rides on professionally driven buses and vans.",
        type: "NAVIGATION_ITEM_TYPE_HCV",
        url: "https://m.uber.com/looking/"
    }
];


const app = new Hono()
    .get("/getProductSuggestions", async (ctx) => {

        // TODO: FETCH SUGGESTION DYNAMICALLY OR CREATE SUGGESTIONS 

        return ctx.json({
            success: true, data: {
                error: null,
                success: true,
                suggestions: productSuggestions
            }
        })

    });



export default app;