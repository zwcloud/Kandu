﻿using Microsoft.AspNetCore.Http;
using Utility.Strings;

namespace Kandu
{
    public class Controller : Datasilk.Mvc.Controller
    {

        public Controller(HttpContext context, Parameters parameters) : base(context, parameters)
        {
            title = "Kandu";
            description = "You can do everything you ever wanted";
            
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            scripts.Append("<script language=\"javascript\">S.svg.load('/themes/default/icons.svg?v=" + Server.Version + "');</script>");
            return base.Render(path, body, metadata);
        }

        public void LoadHeader(ref Scaffold scaffold, bool hasMenu = true)
        {
            if(User.userId > 0)
            {
                scaffold.Child("header").Show("user");
                scaffold.Child("header")["boards-menu"] = Common.Platform.Boards.RenderBoardsMenu(this);

                if (User.photo == true)
                {
                    scaffold.Child("header")["user-photo"] = "/users/" + FileSystem.DateFolders(User.datecreated) + "/photo.jpg";
                }
                else
                {
                    scaffold.Child("header").Show("no-user");
                }

                //apply user settings to UI layout configuration
                if(hasMenu == true)
                {
                    scaffold.Child("header").Show("boards");
                    scaffold.Child("header").Show("boards-2");
                    if (User.keepMenuOpen == true)
                    {
                        scripts.Append("<script language=\"javascript\">S.head.boards.show();S.head.boards.alwaysShow(true);</script>");
                    }
                }
            }
            else
            {
                scaffold.Child("header").Show("no-user");
            }

        }

        public void LoadPartial(ref Controller page)
        {
            page.scripts.Append(scripts.ToString());
            page.css.Append(css.ToString());
        }
    }
}