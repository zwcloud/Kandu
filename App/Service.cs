using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Datasilk.Core.Web;

namespace Kandu
{
    public class Service : Request, IService
    {
        protected StringBuilder Scripts = new StringBuilder();
        protected StringBuilder Css = new StringBuilder();
        protected List<string> Resources = new List<string>();
        protected bool IsPublicApiRequest { get; set; } = false;

        public virtual Service Instantiate(Request request)
        {
            Path = request.Path;
            PathParts = request.PathParts;
            Context = request.Context;
            Parameters = request.Parameters;
            Init();
            return this;
        }

        public virtual void Init(){}

        public override void Dispose()
        {
            base.Dispose();
            User.Save();
        }

        public string JsonResponse(dynamic obj)
        {
            Context.Response.ContentType = "text/json";
            return JsonSerializer.Serialize(obj);
        }

        protected string Response(string html)
        {
            return JsonResponse(new Response(html, Css.ToString() + Scripts.ToString()));
        }

        public virtual bool CheckSecurity()
        {
            return User.userId > 0;
        }

        public virtual bool CheckSecurity(int boardId)
        {
            return User.CheckSecurity(boardId);
        }

        public virtual bool CheckSecurity(int orgId, Models.Security.Keys key, Models.Scope scope = Models.Scope.All, int scopeId = 0) {
            return User.CheckSecurity(orgId, key, scope, scopeId);
        }

        public bool IsInOrganization(int orgId)
        {
            return User.IsInOrganization(orgId);
        }

        public string Success()
        {
            return "success";
        }

        public string Empty() { return "{}"; }

        public string AccessDenied(string message = "Error 403")
        {
            Context.Response.StatusCode = 403;
            return message;
        }

        public string Error(string message = "Error 500")
        {
            Context.Response.StatusCode = 500;
            return message;
        }

        public string BadRequest(string message = "Bad Request 400")
        {
            Context.Response.StatusCode = 400;
            return message;
        }

        public void AddScript(string url, string id = "", string callback = "")
        {
            if (ContainsResource(url)) { return; }
            Scripts.Append("S.util.js.load('" + url + "', '" + id + "', " + (callback != "" ? callback : "null") + ");");
        }

        public void AddCSS(string url, string id = "")
        {
            if (ContainsResource(url)) { return; }
            Scripts.Append("S.util.css.load('" + url + "', '" + id + "');");
        }

        protected bool ContainsResource(string url)
        {
            if (Resources.Contains(url)) { return true; }
            Resources.Add(url);
            return false;
        }
    }
}