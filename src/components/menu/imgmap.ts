import type { Category } from "./types";

export const PLACEHOLDER_IMG = "/assets/logo.svg";

export const IMGMAP: Record<Category, Record<number, string>> = {
  coffee: { 1:"/assets/menu/coffee-1.jpg",2:"/assets/menu/coffee-2.jpg",3:"/assets/menu/coffee-3.jpg",4:"/assets/menu/coffee-4.jpg",5:"/assets/menu/coffee-5.jpg",6:"/assets/menu/coffee-6.jpg",7:"/assets/menu/coffee-7.jpg",8:"/assets/menu/coffee-8.jpg" },
  tea: { 9:"/assets/menu/tea-1.jpg",10:"/assets/menu/tea-2.jpg",11:"/assets/menu/tea-3.jpg",12:"/assets/menu/tea-4.jpg",13:"/assets/menu/tea-5.jpg",14:"/assets/menu/tea-6.jpg",15:"/assets/menu/tea-7.jpg",16:"/assets/menu/tea-8.jpg",29:"/assets/menu/tea-9.jpg",30:"/assets/menu/tea-10.jpg" },
  dessert: { 17:"/assets/menu/dessert-1.jpg",18:"/assets/menu/dessert-2.jpg",19:"/assets/menu/dessert-3.jpg",20:"/assets/menu/dessert-4.jpg",21:"/assets/menu/dessert-5.jpg",22:"/assets/menu/dessert-6.jpg",23:"/assets/menu/dessert-7.jpg",24:"/assets/menu/dessert-8.jpg",25:"/assets/menu/dessert-9.jpg",26:"/assets/menu/dessert-10.jpg",27:"/assets/menu/dessert-11.jpg",28:"/assets/menu/dessert-12.jpg",31:"/assets/menu/dessert-13.jpg",32:"/assets/menu/dessert-14.jpg" },
};

export const FALLBACKS: Record<Category, string[]> = {
  coffee: ["/assets/menu/coffee-1.jpg","/assets/menu/coffee-2.jpg","/assets/menu/coffee-3.jpg","/assets/menu/coffee-4.jpg","/assets/menu/coffee-5.jpg","/assets/menu/coffee-6.jpg","/assets/menu/coffee-7.jpg","/assets/menu/coffee-8.jpg"],
  tea: ["/assets/menu/tea-1.jpg","/assets/menu/tea-2.jpg","/assets/menu/tea-3.jpg","/assets/menu/tea-4.jpg","/assets/menu/tea-5.jpg","/assets/menu/tea-6.jpg","/assets/menu/tea-7.jpg","/assets/menu/tea-8.jpg","/assets/menu/tea-9.jpg","/assets/menu/tea-10.jpg"],
  dessert: ["/assets/menu/dessert-1.jpg","/assets/menu/dessert-2.jpg","/assets/menu/dessert-3.jpg","/assets/menu/dessert-4.jpg","/assets/menu/dessert-5.jpg","/assets/menu/dessert-6.jpg","/assets/menu/dessert-7.jpg","/assets/menu/dessert-8.jpg","/assets/menu/dessert-9.jpg","/assets/menu/dessert-10.jpg","/assets/menu/dessert-11.jpg","/assets/menu/dessert-12.jpg","/assets/menu/dessert-13.jpg","/assets/menu/dessert-14.jpg"],
};
